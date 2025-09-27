import { useLoaderData, useSearchParams } from "react-router";
import { XStack } from "@tamagui/stacks";
import { Button } from "@tamagui/button";
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
      <Button onPress={handlePrevPage} size="$4" theme="blue">
        Previous
      </Button>

      <Button
        onPress={handleNextPage}
        disabled={pastes.length < 20}
        size="$4"
        theme="blue"
      >
        Next
      </Button>
    </XStack>
  );
}
