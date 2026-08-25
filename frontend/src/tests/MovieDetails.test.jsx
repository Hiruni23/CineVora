import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { getMovieById } from "../services/movieService";
import MovieDetails from "../pages/customers/MovieDetails";

jest.mock("../services/movieService", () => ({
  getMovieById: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "1" }),
}));

jest.mock("../components/ReviewList", () => () => <div>ReviewList</div>);

const mockMovie = {
  _id: "1",
  title: "Test Movie",
  genre: "Action",
  duration: 120,
  rating: 8.5,
  description: "Test movie description",
  posterUrl: "poster.jpg",
  trailerUrl: "https://www.youtube.com/embed/test",
};

describe("MovieDetails Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMovieById.mockResolvedValue(mockMovie);
  });

  test("renders loading and then movie details", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading movie/i)).toBeInTheDocument();

    expect(await screen.findByText("Test Movie")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText(/120\s*min/i)).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
    expect(screen.getByText("Test movie description")).toBeInTheDocument();
    expect(screen.getByAltText("Test Movie")).toBeInTheDocument();
  });

  test("Book Now button navigates to booking page", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    const bookBtn = await screen.findByText(/Book Now/i);
    fireEvent.click(bookBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/buy-tickets/1");
  });

  test("Watch Trailer button opens and closes modal", async () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    const trailerBtn = await screen.findByText(/Watch Trailer/i);
    expect(screen.queryByTitle(/Test Movie/i)).not.toBeInTheDocument();

    fireEvent.click(trailerBtn);
    expect(screen.getByTitle(/Test Movie/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("×"));
    expect(screen.queryByTitle(/Test Movie/i)).not.toBeInTheDocument();
  });
});