import { List } from "antd";
import SearchBox, {
  useSearchAll,
  SearchBoxOptions,
} from "components/Inputs/Searchbox";
import { Link } from "react-router-dom";

type ResultArray = ReturnType<typeof useSearchAll>["data"];
type ResultItem = ResultArray extends Array<infer T> ? T : never;

export default function AppSearch() {
  const renderResults: SearchBoxOptions<ResultItem>["renderList"] = (
    items,
    context
  ) => {
    const totalResults = items.reduce(
      (total, item) => total + item.value.length,
      0
    );
    if (totalResults === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
          {/* Placeholder */}
          <img
            loading="lazy"
            src="/empty2.jpg"
            alt="No results"
            className="w-16 h-16 mb-2"
          />
          <span className="text-sm text-gray-500">No results found</span>
        </div>
      );
    }
    return (
      <List
        className="w-full overflow-y-auto min-h-[8rem] max-h-[20rem] bg-white rounded-lg shadow-md p-2"
        bordered
      >
        {items.map((item) => {
          const {
            key,
            value: arr,
            toString,
            collection: collectionName,
          } = item;
          return (
            arr.length > 0 && (
              <List.Item key={key} className="mb-2">
                <div className="p-2 w-full border-b border-gray-200">
                  {/* Section Header */}
                  <div className="font-semibold text-lg text-gray-700 capitalize mb-2">
                    {key.replace("/", "").replace(/-/g, " ")}
                  </div>
                  {/* Section Items */}
                  {arr.length > 0 && (
                    <List
                      className="ml-4 bg-gray-50 rounded-lg p-2"
                      size="small"
                      bordered
                    >
                      {arr.map((item, index) => {
                        return (
                          <List.Item
                            key={index}
                            className="overflow-clip text-sm text-gray-600 hover:bg-gray-100 rounded-md px-2"
                          >
                            <Link
                              to={`/management/${collectionName}?searchId=${item._id}`}
                              style={{ textDecoration: "none" }}
                              onClick={() => context?.clickItem?.()}
                            >
                              {toString(item)}
                            </Link>
                          </List.Item>
                        );
                      })}
                    </List>
                  )}
                </div>
              </List.Item>
            )
          );
        })}
      </List>
    );
  };
  // return null;
  return (
    <SearchBox
      useSearch={useSearchAll}
      renderList={renderResults}
      searchProps={{
        size: "large",
      }}
    />
  );
}
