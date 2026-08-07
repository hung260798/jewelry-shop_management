import { IdWise } from "@/utils/types/Entities";
import { CloseCircleFilled, SearchOutlined } from "@ant-design/icons";
import { Button, Input, List } from "antd";
import { SearchProps } from "antd/es/input";
import ErrorAndLoading from "components/Placeholders/ErrorAndLoading";
import { useRef, useState } from "react";
import style from "./style.module.css";

type Element = JSX.Element;

const SEARCH_DELAY_MS = 500;

type Context = {
  clearTerm?: () => void;
  clickItem?: () => void;
};

export interface SearchBoxOptions<T extends object = IdWise> {
  searchHook: () => {
    data: T[];
    error: unknown;
    isLoading: boolean;
    onSearch: (word: string) => Promise<void>;
    loadMore?: (pageSize?: number) => void;
  };
  renderItemFn?: (item: T, context: Context) => Element;
  renderListFn?: (items: T[], context?: Context) => Element;
}

export default function SearchBox<T extends object = IdWise>({
  searchHook: useSearch,
  renderItemFn: renderItem,
  renderListFn: renderList,
  searchProps = {},
}: SearchBoxOptions<T> & { searchProps?: SearchProps }) {
  const { data, error, isLoading, onSearch, loadMore } = useSearch();
  const DataRender = (data: T[]) => {
    const dataArray = data;
    if (renderList) {
      return renderList(dataArray, {});
    } else if (renderItem) {
      return (
        <List className="rounded shadow max-h-40 overflow-y-auto" size="small">
          {[
            ...dataArray.map((item, index) => {
              const key =
                "_id" in item && typeof item._id === "string"
                  ? item._id
                  : index;
              return <List.Item key={key}>{renderItem(item, {})}</List.Item>;
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

  return (
    <SearchBoxAndResults onSearch={onSearch} searchProps={searchProps}>
      <ErrorAndLoading
        error={error}
        isLoading={isLoading}
        data={isLoading ? null : data}
        DataRender={DataRender}
      />
    </SearchBoxAndResults>
  );
}

function SearchBoxAndResults({
  onSearch,
  searchProps = {},
  children,
}: {
  onSearch: (term: string) => Promise<void>;
  searchProps?: SearchProps;
  children: React.ReactNode;
}) {
  const searchTimeout = useRef<NodeJS.Timeout>();
  const removeMaskTimeout = useRef<NodeJS.Timeout>();
  const [isTyping, setIsTyping] = useState(false);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [maskBg, setMaskBg] = useState(false);
  const [didMaskOpen, setDidMaskOpen] = useState(false);

  const hideMask = () => {
    setIsShowingResult(false);
    setMaskBg(false);
    clearTimeout(removeMaskTimeout.current);
    removeMaskTimeout.current = setTimeout(() => {
      setDidMaskOpen(false);
    }, 600);
  };

  const showMask = () => {
    setIsShowingResult(true);
    clearTimeout(removeMaskTimeout.current);
    setDidMaskOpen(true);
    removeMaskTimeout.current = setTimeout(() => {
      setMaskBg(true);
    }, 0);
  };

  return (
    <div className={`${style.searchShell} relative`}>
      <Input.Search
        name="search"
        className={`${style.searchInput} w-full relative`}
        prefix={<SearchOutlined className={style.searchIcon} />}
        placeholder="Tìm..."
        onClear={hideMask}
        allowClear={{ clearIcon: <CloseCircleFilled className="text-xl" /> }}
        onChange={(e) => {
          setIsTyping(true);
          clearTimeout(searchTimeout.current);
          const term = e.target.value;
          const trimmed = term.trim();
          searchTimeout.current = setTimeout(() => {
            onSearch(trimmed);
            setIsTyping(false);
          }, SEARCH_DELAY_MS);
          if (trimmed) {
            showMask();
          } else {
            hideMask();
          }
        }}
        {...searchProps}
      />
      {didMaskOpen && (
        <div
          className={`${style.mask} ${maskBg ? style.showing : ""}`}
          onClick={() => {
            hideMask();
          }}
        ></div>
      )}
      <div className={`${style.resultPanel} w-full absolute bg-white`}>
        {!isTyping && isShowingResult && children}
      </div>
    </div>
  );
}
