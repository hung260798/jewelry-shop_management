import _ from "lodash";
import { defaultQueryObj } from "../hooks/useMyQuery";

export default function Experiment() {
  const params = new URLSearchParams(defaultQueryObj);
  console.log("params", params.toString());
  return (
    <div>
      <h1 className="hidden">Experiment</h1>
    </div>
  );
}
