import {
  Suspense,
} from "react";

import {
  CountryPageContent,
  CountryPageLoading,
} from "./CountryPageContent";

type CountryPageProps = {
  params:
    Promise<{
      countrySlug:
        string;
    }>;
};

export default function CountryPage({
  params,
}: CountryPageProps) {
  return (
    <Suspense
      fallback={
        <CountryPageLoading />
      }
    >
      <CountryRouteContent
        params={params}
      />
    </Suspense>
  );
}

async function CountryRouteContent({
  params,
}: CountryPageProps) {
  const {
    countrySlug,
  } = await params;

  return (
    <CountryPageContent
      countrySlug={
        countrySlug
      }
    />
  );
}
