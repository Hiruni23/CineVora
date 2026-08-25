import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("axios", () => {
  const mockAxiosInstance = {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    ...mockAxiosInstance,
    create: jest.fn(() => mockAxiosInstance),
  };
});

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

jest.mock("./services/movieService", () => ({
  getMovies: jest.fn(() => Promise.resolve([])),
  getMovieById: jest.fn(() => Promise.resolve({})),
}));

import App from "./App";

test("renders app header link", () => {
  render(<App />);
  const headerLink = screen.getByRole("link", { name: /CineVora/i });
  expect(headerLink).toBeInTheDocument();
});