import {
  getCardControlsFromRecord,
  ModalCard,
  useModalCard,
} from "@/components/Forms/ModalCard";
import SearchBox from "@/components/Inputs/Searchbox";
import { Empty } from "antd";
import useSearchAll from "./useSearchAll";
import { SearchBoxOptions } from "../Inputs/Searchbox/Searchbox";

type ResultArray = ReturnType<typeof useSearchAll>["data"];
type ResultItem = ResultArray extends Array<infer T> ? T : never;

export default function AppSearch() {
  const openModal = useModalCard((s) => s.openModal);
  const cardValues = useModalCard((s) => s.cardValues);

  const renderResults: SearchBoxOptions<ResultItem>["renderListFn"] = (
    items,
    context
  ) => {
    const totalResults = items.reduce(
      (total, item) => total + item.value.length,
      0
    );
    if (totalResults === 0) {
      return (
        <div className="bg-white p-6">
          <Empty
            image="/empty2.jpg"
            imageStyle={{ height: 72 }}
            description={
              <span className="text-sm font-medium text-slate-500">
                No results found
              </span>
            }
          />
        </div>
      );
    }

    const sections = items.filter((item) => item.value.length > 0);

    return (
      <div className="w-full overflow-y-auto min-h-32 max-h-96 bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Search results
            </div>
            <div className="text-xs text-slate-500">
              {totalResults} matching record{totalResults === 1 ? "" : "s"}
            </div>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {sections.length} section{sections.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-4 p-3">
          {sections.map((item) => {
            const { key, value: arr, toString } = item;
            return (
              <section key={key}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="m-0 text-xs font-bold uppercase text-slate-500">
                    {key.replace("/", "").replace(/-/g, " ")}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {arr.length}
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  {arr.map((item, index) => {
                    return (
                      <button
                        key={index}
                        type="button"
                        className="block w-full border-b border-slate-100 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition last:border-b-0 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:outline-none"
                        onClick={() => {
                          openModal(item, "search-all");
                          context?.clickItem?.();
                          context?.clearTerm?.();
                        }}
                      >
                        <span className="line-clamp-2">{toString(item)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  const controls = cardValues
    ? getCardControlsFromRecord(cardValues as Record<string, unknown>)
    : [];

  return (
    <>
      <SearchBox
        searchHook={useSearchAll}
        renderListFn={renderResults}
        searchProps={{
          size: "large",
          enterButton: true,
        }}
      />
      <ModalCard
        collectionName="search"
        title="Record details"
        cardControls={controls}
      />
    </>
  );
}
