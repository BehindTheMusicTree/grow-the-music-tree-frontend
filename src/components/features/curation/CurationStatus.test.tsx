import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CurationStatus from "./CurationStatus";

describe("CurationStatus", () => {
  afterEach(cleanup);

  it("dates the last applied run and counts pending edits", () => {
    render(<CurationStatus status={{ appliedExportOn: "2026-10-01T12:30:00Z", pendingCount: 3 }} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/dernier run du pipeline appliqué le 1 oct\. 2026,? 14:30/i);
    expect(status).toHaveTextContent("3 modifications en attente, appliquées au prochain run.");
  });

  it("says when no run was recorded and nothing is pending", () => {
    render(<CurationStatus status={{ appliedExportOn: null, pendingCount: 0 }} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Aucun run du pipeline enregistré. Aucune modification en attente.",
    );
  });
});
