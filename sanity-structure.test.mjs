import assert from "node:assert/strict";
import test from "node:test";

import { caseStructure } from "./sanity/structure.js";

test("Case Pages use Sanity's supported default ordering API", () => {
  const recordedOrderings = [];
  const documentList = {
    title() {
      return this;
    },
    defaultOrdering(ordering) {
      recordedOrderings.push(ordering);
      return this;
    },
  };
  const listItem = {
    title() {
      return this;
    },
    schemaType() {
      return this;
    },
    child() {
      return this;
    },
  };
  const rootList = {
    title() {
      return this;
    },
    items() {
      return this;
    },
  };
  const structureBuilder = {
    documentTypeList() {
      return documentList;
    },
    list() {
      return rootList;
    },
    listItem() {
      return listItem;
    },
  };

  assert.doesNotThrow(() => caseStructure(structureBuilder));
  assert.deepEqual(recordedOrderings, [[{ field: "order", direction: "asc" }]]);
});
