import { useLoaderData, useSearchParams } from "react-router";
import { XStack } from "@tamagui/stacks";
import { PaginationButton } from "../ui/PaginationButton";
import type { PasteListLoaderData } from "../../loaders/pasteListLoader";

export function PasteListPaginationButtons() {
  const { pastes, nextCursor, cursor, prevCursor } =
    useLoaderData() as PasteListLoaderData;

  const [, setSearchParams] = useSearchParams();

  const handleNextPage = () => {
    if (nextCursor) {
      setSearchParams({ prev: cursor || "", cursor: nextCursor });
    }
  };

  const handlePrevPage = () => {
    // TODO: How do we get prev here?
    setSearchParams({ prev: "", cursor: prevCursor || "" });
  };

  return (
    <XStack gap="$3" justifyContent="center" alignItems="center">
      <PaginationButton onPress={handlePrevPage} size="$4" colorVariant="blue">
        Previous
      </PaginationButton>

      <PaginationButton
        onPress={handleNextPage}
        disabled={pastes.length < 20}
        size="$4"
        colorVariant="blue"
      >
        Next
      </PaginationButton>
    </XStack>
  );
}
