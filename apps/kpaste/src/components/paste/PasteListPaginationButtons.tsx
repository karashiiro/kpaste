import { useLoaderData, useSearchParams } from "react-router";
import { XStack } from "@tamagui/stacks";
import { PaginationButton } from "@kpaste/ui";
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

  const prevDisabled = !prevCursor;
  const nextDisabled = pastes.length < 20;

  return (
    <XStack gap="$3" justifyContent="center" alignItems="center">
      {!prevDisabled && (
        <PaginationButton
          onPress={handlePrevPage}
          disabled={prevDisabled}
          size="$4"
          colorVariant="blue"
        >
          Previous
        </PaginationButton>
      )}

      {!nextDisabled && (
        <PaginationButton
          onPress={handleNextPage}
          disabled={nextDisabled}
          size="$4"
          colorVariant="blue"
        >
          Next
        </PaginationButton>
      )}
    </XStack>
  );
}
