import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Combobox from "./Combobox";

const options = [
  { key: "a", content: "Alpha" },
  { key: "b", content: "Beta" },
];

const renderCombobox = (props: Partial<React.ComponentProps<typeof Combobox>> = {}) => {
  const onPick = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <Combobox
      ariaLabel="Pick"
      listLabel="Choices"
      value=""
      options={options}
      open
      onValueChange={vi.fn()}
      onOpenChange={onOpenChange}
      onPick={onPick}
      {...props}
    />,
  );
  return { onPick, onOpenChange, input: screen.getByRole("combobox", { name: "Pick" }) };
};

describe("Combobox", () => {
  afterEach(cleanup);

  it("moves the active option with the arrow keys, wrapping around", () => {
    const { input } = renderCombobox();
    expect(screen.getByRole("option", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: "Beta" })).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: "Alpha" })).toHaveAttribute("aria-selected", "true");
  });

  it("picks the active option on Enter", () => {
    const { input, onPick } = renderCombobox();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onPick).toHaveBeenCalledWith(1);
  });

  it("asks to load more instead of wrapping past the last option", () => {
    const onLoadMore = vi.fn();
    const { input } = renderCombobox({ canLoadMore: true, onLoadMore });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(onLoadMore).toHaveBeenCalledOnce();
    expect(screen.getByRole("option", { name: "Beta" })).toHaveAttribute("aria-selected", "true");
  });

  it("requests closing on Escape and on blur", () => {
    const { input, onOpenChange } = renderCombobox();
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);

    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders no list when closed", () => {
    renderCombobox({ open: false });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Pick" })).toHaveAttribute("aria-expanded", "false");
  });
});
