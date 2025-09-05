// // Working prototype for the figma like drag and drop functionality for the database display.
// import { useState, useEffect } from "react";

// const Mainpage = () => {
//   const[add, setAdd] = useState(false)
//   const[data, setData] = useState("")

//   function handleSlider(){
//     {setAdd(true) ? (
//       <>
//       {/* This will be for writing the sideBar component  */}
//       </>
//     ) : (
//       <>
//       {/* This will be for writing the circular component */}
//       </>
//     )}
//   }

//   return(
//     <>
//     <button onClick={handleSlider}>+</button>
//     </>
//   )
// }

// export default Mainpage;

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Visual PostgreSQL Designer</h1>
      <Link href="/erd">Go to ERD</Link>
    </main>
  );
}
