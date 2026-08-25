import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../services/movieService", () => ({
  getMovieById: jest.fn(),
}));
import { getMovieById } from "../services/movieService";

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));
import API from "../services/api";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "1" }),
}));

const mockMovie = {
  _id: "1",
  title: "Test Movie",
  genre: "Action",
  duration: 120,
  rating: 8.5,
  description: "Test movie description",
  posterUrl: "poster.jpg",
  trailerUrl: "https://www.youtube.com/watch?v=test123",
  reviewCount: 0,
  averageRating: 0,
  language: "English",
  releaseYear: 2024,
  director: "Test Director",
};

import MovieDetails from "../pages/customers/MovieDetails";

describe("MovieDetails Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMovieById.mockResolvedValue(mockMovie);
    API.get.mockImplementation((url) => {
      if (url.includes("/reviews/check/")) {
        return Promise.resolve({ data: { canReview: false } });
      }
      if (url.includes("/reviews/movie/")) {
        return Promise.resolve({
          data: { reviews: [], total: 0, page: 1, totalPages: 1 },
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test("renders loading and then movie details", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading movie/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
      expect(screen.getByText(/Action/i)).toBeInTheDocument();
      expect(screen.getByText("Test movie description")).toBeInTheDocument();
      expect(screen.getByAltText("Test Movie")).toBeInTheDocument();
    });
  });

  test("Book Now button navigates to booking page", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Book Now/i));

    fireEvent.click(screen.getByText(/Book Now/i));
    expect(mockNavigate).toHaveBeenCalledWith("/buy-tickets/1");
  });

  test("Watch Trailer button opens and closes modal", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Watch Trailer/i));

    expect(screen.queryByTitle(/Test Movie/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Watch Trailer/i));
    expect(screen.getByTitle(/Test Movie Trailer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close trailer"));
    expect(screen.queryByTitle(/Test Movie Trailer/i)).not.toBeInTheDocument();
  });
});