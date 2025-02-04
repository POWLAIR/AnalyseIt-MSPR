import React from "react";
import { render, screen } from "@testing-library/react";
import { test, expect } from "@jest/globals";
import App from "../App";

test("renders header", () => {
  render(<App />);
  const headerElement = screen.getByText(/AnalyseIt - Frontend/i);
  expect(headerElement).toBeInTheDocument();
});

test("renders API status", () => {
  render(<App />);
  const statusElement = screen.getByText(/API Status:/i);
  expect(statusElement).toBeInTheDocument();
});
