import { Button, Input, List } from "antd";
import { SearchProps } from "antd/es/input";
import ErrorAndLoading from "components/Placeholders/ErrorAndLoading";
import { useEffect, useRef, useState } from "react";
import style from "./style.module.css";

type Element = JSX.Element;

const SEARCH_DELAY_MS = 500;

type Context = {
  clearTerm?: () => void;
  clickItem?: () => void;
};

export interface SearchBoxOptions<T extends object = { _id: string }> {
  searchHook: () => {
    data: T[];
    error: unknown;
    isLoading: boolean;
    onSearch: (word: string) => void;
    loadMore?: (pageSize?: number) => void;
  };
  renderItemFn?: (item: T, context: Context) => Element;
  renderListFn?: (items: T[], context?: Context) => Element;
}

export default function SearchBox<T extends object = { _id: string }>({
  searchHook: useSearch,
  renderItemFn: renderItem,
  renderListFn: renderList,
  searchProps = {},
}: SearchBoxOptions<T> & { searchProps?: SearchProps }) {
  const timeout = useRef<NodeJS.Timeout>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [maskBg, setMaskBg] = useState(false);
  const [isRemovingMask, setIsRemovingMask] = useState(false);
  const removeMaskTimeout = useRef<NodeJS.Timeout>();
  const [isMaskAppear, setIsMaskAppear] = useState(false);

  useEffect(() => {
    if (searchTerm.trim()) {
      setIsShowingResult(true);
    } else {
      setIsShowingResult(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isShowingResult) {
      if (isRemovingMask) {
        clearTimeout(removeMaskTimeout.current);
        setIsRemovingMask(false);
        setMaskBg(true);
      } else {
        setIsMaskAppear(true);
      }
    } else {
      setMaskBg(false);
      setIsRemovingMask(true);
      removeMaskTimeout.current = setTimeout(() => {
        setIsMaskAppear(false);
        setIsRemovingMask(false);
      }, 600);
    }
  }, [isShowingResult, removeMaskTimeout]);

  useEffect(() => {
    if (isMaskAppear) {
      setMaskBg(true);
    }
  }, [isMaskAppear]);

  const { data, error, isLoading, onSearch, loadMore } = useSearch();

  const DataRender = (data: T[]) => {
    const dataArray = data;
    if (renderList) {
      const context = {
        clearTerm: () => setSearchTerm(""),
        clickItem: () => setIsShowingResult(false),
      };
      return renderList(dataArray, context);
    } else if (renderItem) {
      return (
        <List className="rounded shadow max-h-40 overflow-y-auto" size="small">
          {[
            ...dataArray.map((item, index) => {
              const key =
                "_id" in item && typeof item._id === "string"
                  ? item._id
                  : index;
              return (
                <List.Item key={key}>
                  {renderItem(item, { clearTerm: () => setSearchTerm("") })}
                </List.Item>
              );
            }),
            <List.Item key={"load more"}>
              <div className="flex justify-center items-center w-full">
                <Button size="small" type="link" onClick={() => loadMore?.()}>
                  Load more
                </Button>
              </div>
            </List.Item>,
          ]}
        </List>
      );
    } else {
      return null;
    }
  };

  const searchResults = isShowingResult ? (
    <ErrorAndLoading
      error={error}
      isLoading={isLoading || isTyping}
      data={isTyping ? null : data}
      DataRender={DataRender}
    />
  ) : null;

  return (
    <div className="relative">
      <Input.Search
        name="search"
        className="w-full relative z-12"
        onClear={() => setSearchTerm("")}
        allowClear
        onChange={(e) => {
          setIsTyping(true);
          const term = e.target.value;
          setSearchTerm(term);
          if (timeout.current) {
            clearTimeout(timeout.current);
          }
          timeout.current = setTimeout(() => {
            onSearch(term);
            setIsTyping(false);
          }, SEARCH_DELAY_MS);
        }}
        value={searchTerm}
        {...searchProps}
      />
      {isMaskAppear && (
        <div
          className={`${style.mask} ${maskBg ? style.showing : ""}`}
          onClick={() => {
            setIsShowingResult(false);
          }}
        ></div>
      )}
      <div className="w-full absolute z-100 bg-white rounded shadow-xl overflow-hidden">
        {searchResults}
      </div>
    </div>
  );
}
