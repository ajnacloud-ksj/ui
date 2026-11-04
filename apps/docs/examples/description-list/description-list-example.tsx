"use client";

import {
  DescriptionDetail,
  DescriptionGroup,
  DescriptionList,
  DescriptionTerm,
} from "@ajnacloud/ui/description-list";

export function DescriptionListExample() {
  return (
    <DescriptionList orientation="horizontal" className="w-full">
      <DescriptionGroup>
        <DescriptionTerm>Item</DescriptionTerm>
        <DescriptionDetail>Standing desk</DescriptionDetail>
      </DescriptionGroup>
      <DescriptionGroup>
        <DescriptionTerm>Quantity</DescriptionTerm>
        <DescriptionDetail>{0}</DescriptionDetail>
      </DescriptionGroup>
      <DescriptionGroup>
        <DescriptionTerm>Notes</DescriptionTerm>
        <DescriptionDetail>
          Adjustable height. Ships assembled.
        </DescriptionDetail>
      </DescriptionGroup>
    </DescriptionList>
  );
}
