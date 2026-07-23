import {
  Suspense,
} from "react";

import {
  notFound,
} from "next/navigation";

import {
  CountryPageContent,
  CountryPageLoading,
  parseCountryCategorySegment,
} from "../CountryPageContent";

type CountryCategoryPageProps = {
  params:
    Promise<{
      countrySlug:
        string;

      category:
        string;
    }>;
};

export default function CountryCategoryPage({
  params,
}: CountryCategoryPageProps) {
  return (
    <Suspense
      fallback={
        <CountryPageLoading />
      }
    >
      <CountryCategoryRouteContent
        params={params}
      />
    </Suspense>
  );
}

async function CountryCategoryRouteContent({
  params,
}: CountryCategoryPageProps) {
  const {
    countrySlug,
    category:
      categorySegment,
  } = await params;

  const category =
    parseCountryCategorySegment(
      categorySegment,
    );

  if (!category) {
    notFound();
  }

  return (
    <CountryPageContent
      countrySlug={
        countrySlug
      }
      category={
        category
      }
    />
  );
}
