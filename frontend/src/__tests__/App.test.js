import React from "react";
import { render, screen } from "@testing-library/react";
import { test, expect } from "@jest/globals";
import App from "./App";

test("renders welcome message", () => {
  render(<App />);
  const linkElement = screen.getByText(/Bienvenue dans AnalyseIt/i);
  expect(linkElement).toBeInTheDocument();
});
