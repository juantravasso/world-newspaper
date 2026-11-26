/**
 * Mantém os `maxPerSource` primeiros itens de cada
 * fonte, preservando a ordem recebida.
 */
export function limitPerSource<
  Item extends {
    sourceId:
      string;
  },
>(
  orderedNews:
    Item[],

  maxPerSource:
    number,
): Item[] {
  const countBySource =
    new Map<
      string,
      number
    >();

  return orderedNews.filter(
    (item) => {
      const count =
        countBySource.get(
          item.sourceId,
        ) ??
        0;

      if (
        count >=
        maxPerSource
      ) {
        return false;
      }

      countBySource.set(
        item.sourceId,
        count +
          1,
      );

      return true;
    },
  );
}
