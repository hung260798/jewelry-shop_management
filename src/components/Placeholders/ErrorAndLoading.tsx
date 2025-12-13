import { Spin } from "antd";

function ErrorAndLoading({
  data,
  error,
  isLoading,
  ErrorRender,
  LoadingRender,
  DataRender,
}: {
  data: unknown;
  error: unknown;
  isLoading: boolean;
  ErrorRender?: (error: unknown) => JSX.Element;
  LoadingRender?: (isLoading: boolean) => JSX.Element;
  DataRender?: (data: any) => JSX.Element | null;
}) {
  let content: JSX.Element | null;
  if (error) {
    console.error(error);
    if (ErrorRender) {
      content = ErrorRender(error);
    } else {
      content = (
        <div className={"flex justify-center items-center"}>
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      );
    }
  } else if (isLoading) {
    content = LoadingRender ? (
      LoadingRender(isLoading)
    ) : (
      <div className="text-center py-4 bg-white w-full min-h-10">
        <Spin />
      </div>
    );
  } else if (data) {
    content = DataRender ? DataRender(data) : <div>data</div>;
  } else {
    content = null;
  }
  return content;
}

export default ErrorAndLoading;
