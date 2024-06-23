"use client"
import { useFormStatus } from "react-dom";

export default function FormSubmit() {
  const status = useFormStatus();

   if(status.pending){
    return <p>전송중...</p>;
   }


  return (
    <>
      <button type="reset">초기화</button>
      <button>글작성</button>
    </>
  );
}
