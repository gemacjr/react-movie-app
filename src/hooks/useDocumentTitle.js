import { useEffect } from "react";

/**
 * WHAT: Set `document.title` while a component is mounted (or while `title` is set).
 *
 * HOW:
 * - Remember the previous title, assign the new one in an effect.
 * - On cleanup (unmount or before the next title change), restore the previous title
 *   so navigating away does not leave a stale movie name in the tab.
 *
 * WHY: Browser tabs are part of UX. Updating the title helps users find the right
 * tab among many, and is friendlier for accessibility/bookmarks. Doing it in a hook
 * keeps pages free of duplicated `document.title = ...` noise.
 *
 * PITFALLS:
 * - Only one "owner" should set the title at a time; nested owners (page + modal)
 *   stack via cleanup restore — open modal sets title, close restores page title.
 * - Effects run after paint; the first paint may briefly show the old title.
 *
 * @param {string} title
 * @param {{ restoreOnUnmount?: boolean }} [options]
 */
export function useDocumentTitle(title, { restoreOnUnmount = true } = {}) {
  useEffect(() => {
    if (!title) return undefined;

    const previous = document.title;
    document.title = title;

    return () => {
      if (restoreOnUnmount) {
        document.title = previous;
      }
    };
  }, [title, restoreOnUnmount]);
}
