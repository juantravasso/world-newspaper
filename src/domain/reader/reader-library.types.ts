import type {
  CountryCode,
  NewsCategory,
} from "@/domain/news/news.types";

import type {
  NewsStory,
} from "@/domain/news/story.types";

export type ReaderHistoryEntry = {
  storyId:
    string;

  readAtISO:
    string;
};

export type ReaderLibraryState = {
  version:
    1;

  savedStoryIds:
    string[];

  history:
    ReaderHistoryEntry[];

  favoriteCategories:
    NewsCategory[];

  favoriteCountryCodes:
    CountryCode[];
};

export type ReaderLibraryCountryOption = {
  code:
    CountryCode;

  name:
    string;
};

export type ReaderLibraryStoryItem = {
  story:
    NewsStory;

  country: {
    code:
      CountryCode;

    name:
      string;

    slug:
      string;
  } | null;

  sourceCount:
    number;

  publishedAtLabel:
    string;
};

export type ReaderLibraryRequest = {
  savedStoryIds:
    string[];

  historyStoryIds:
    string[];

  favoriteCategories:
    NewsCategory[];

  favoriteCountryCodes:
    CountryCode[];
};

export type ReaderLibraryResponse = {
  saved:
    ReaderLibraryStoryItem[];

  history:
    ReaderLibraryStoryItem[];

  recommendations:
    ReaderLibraryStoryItem[];
};
