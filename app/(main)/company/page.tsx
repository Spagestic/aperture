import React from "react";
import { Input } from "@/components/ui/input";

export default function page() {
  const num = 1 + 1;
  console.log("this is a company page running on the server");
  console.log(num);
  return (
    <div>
      The number is {num}
      <Input placeholder="Type here" />
    </div>
  
  );
}
