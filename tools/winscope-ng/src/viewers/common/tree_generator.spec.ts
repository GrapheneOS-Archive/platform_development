/*
 * Copyright (C) 2022 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { DiffType, getFilter, HierarchyTree, TreeFlickerItem } from "viewers/common/tree_utils";
import { TreeGenerator } from "viewers/common/tree_generator";
import { HierarchyTreeBuilder } from "test/unit/hierarchy_tree_builder";

describe("TreeGenerator", () => {
  let entry: TreeFlickerItem;
  beforeAll(async () => {
    entry = {
      kind: "entry",
      name: "BaseLayerTraceEntry",
      stableId: "BaseLayerTraceEntry",
      id: 0,
      chips: [],
      children: [{
        kind: "3",
        id: 3,
        name: "Child1",
        stableId: "3 Child1",
        children: [
          {
            kind: "2",
            id: 2,
            name: "Child2",
            stableId: "2 Child2",
            children: []
          }
        ]}]
    };
  });
  it("generates tree", () => {
    const expected: HierarchyTree = new HierarchyTreeBuilder().setName("BaseLayerTraceEntry").setKind("entry").setStableId("BaseLayerTraceEntry")
      .setChildren([
        new HierarchyTreeBuilder().setName("Child1").setStableId("3 Child1").setKind("3").setChildren([
          new HierarchyTreeBuilder().setName("Child2").setStableId("2 Child2").setKind("2").setId(2).build()
        ]).setId(3).build()
      ]).setId(0).build();

    const filter = getFilter("");
    const generator = new TreeGenerator(entry, filter);
    expect(generator.generateTree()).toEqual(expected);
  });

  it("generates diff tree with no diff", () => {
    const expected: HierarchyTree = new HierarchyTreeBuilder().setName("BaseLayerTraceEntry").setKind("entry").setStableId("BaseLayerTraceEntry")
      .setChildren([
        new HierarchyTreeBuilder().setName("Child1").setStableId("3 Child1").setKind("3").setChildren([
          new HierarchyTreeBuilder().setName("Child2").setStableId("2 Child2").setKind("2").setId(2).setDiffType(DiffType.NONE).build()
        ]).setId(3).setDiffType(DiffType.NONE).build()
      ]).setId(0).setDiffType(DiffType.NONE).build();

    const filter = getFilter("");
    const tree = new TreeGenerator(entry, filter).withUniqueNodeId((node: any) => {
      if (node) return node.stableId;
      else return null;
    }).compareWith(entry).generateFinalTreeWithDiff();
    expect(tree).toEqual(expected);
  });

  it("generates diff tree with moved node", () => {
    const prevEntry: TreeFlickerItem = {
      kind: "entry",
      name: "BaseLayerTraceEntry",
      stableId: "BaseLayerTraceEntry",
      chips: [],
      id: 0,

      children: [
        {
          kind: "3",
          id: 3,
          stableId: "3 Child1",
          name: "Child1",
          children: []
        },
        {
          kind: "2",
          id: 2,
          stableId: "2 Child2",
          name: "Child2",
          children: [],
        }
      ]
    };

    const expected: HierarchyTree = new HierarchyTreeBuilder().setName("BaseLayerTraceEntry").setKind("entry").setStableId("BaseLayerTraceEntry")
      .setChildren([
        new HierarchyTreeBuilder().setName("Child1").setStableId("3 Child1").setKind("3").setChildren([
          new HierarchyTreeBuilder().setName("Child2").setStableId("2 Child2").setKind("2").setId(2).setDiffType(DiffType.ADDED_MOVE).build()
        ]).setId(3).setDiffType(DiffType.NONE).build(),
        new HierarchyTreeBuilder().setName("Child2").setStableId("2 Child2").setKind("2").setId(2).setDiffType(DiffType.DELETED_MOVE).build()
      ]).setId(0).setDiffType(DiffType.NONE).build();

    const filter = getFilter("");
    const generator = new TreeGenerator(entry, filter);
    const newDiffTree = generator.withUniqueNodeId((node: any) => {
      if (node) return node.stableId;
      else return null;
    }).compareWith(prevEntry).generateFinalTreeWithDiff();

    expect(newDiffTree).toEqual(expected);
  });
});