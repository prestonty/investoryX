// // "use client";

// // import { useState, useEffect } from "react";
// // import { useParams } from "next/navigation";
// import { FourSquare } from "react-loading-indicators";
// import axios from "axios";
// import { dateConverter } from "@/utils/helper";
// import type { PeriodType, IntervalType } from "@/types/history";
// import { PeriodOptions, IntervalOptions } from "@/types/history";
// import Navbar from "@/components/Navbar";
// import CandlestickChart from "@/components/tools/Chart";
// import Autocomplete from "@/components/Autocomplete";

// type OHLC = {
//     date: string;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     volume: number;
//     dividends: number;
// };

// interface ChartProps {
//     data: OHLC[];
//     title?: string;
// }

// export default async function Stock({
//     params,
// }: {
//     params: { ticker: string };
// }) {
//     const { ticker } = params;
//     // const params = useParams();

//     // const [chartData, setChartData] = useState<ChartProps>(null);
//     // const [ticker, setTicker] = useState(
//     //     params?.ticker?.toString().toUpperCase()
//     // );
//     // const [period, setPeriod] = useState<PeriodType>("1mo");
//     // const [interval, setInterval] = useState<IntervalType>("1d");

//     // useEffect(() => {
//     //     const fetchData = async () => {
//     //         try {
//     //             const result = await axios(
//     //                 `${process.env.NEXT_PUBLIC_URL}/stock-history/${ticker}?period=${period}&interval=${interval}`
//     //             );
//     //             setChartData(result.data);
//     //         } catch (error) {
//     //             console.error("Error fetching stock data: ", error);
//     //         }
//     //     };
//     //     fetchData();
//     // }, [ticker, period, interval]);
//     return (
//         <div className="bg-light font-[family-name:var(--font-geist-sans)] h-screen flex flex-col">
//             <div className="flex flex-col justify-evenly mb-4">
//                 <Navbar search={true} />
//             </div>

//             <div className="grid grid-cols-5 grid-rows-12 gap-10 flex-1 px-16 pt-4 pb-10">
//                 {/* Top left */}
//                 <div className="col-start-1 col-end-4 row-start-1 row-end-4 bg-white rounded-[30px] shadow-dark-md">
//                     <div className="flex flex-col justify-center h-full py-4 px-8">
//                         <h1 className="text-3xl text-black font-medium">
//                             Meta Platforms Inc (Meta)
//                         </h1>

//                         <div className="flex text-black items-end mt-2">
//                             <p className="text-md mr-2 font-medium">USD</p>
//                             <p className="text-3xl mr-10 font-semibold">
//                                 620.35
//                             </p>
//                             <p className="text-red text-2xl font-medium">
//                                 -10.44 (-2.5%)
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Top right */}
//                 <div className="col-start-4 col-end-6 row-start-1 row-end-3 bg-white rounded-[30px] shadow-dark-md">
//                     <div className="flex flex-col justify-center h-full py-4 px-8">
//                         <p className="text-black text-xl">Some Data</p>
//                     </div>
//                 </div>

//                 {/* Bottom left */}
//                 <div className="col-start-1 col-end-4 row-start-4 row-end-13 bg-white rounded-[30px] shadow-dark-md">
//                     <div className="flex flex-col h-full py-4 px-8">
//                         <h2 className="text-black text-2xl">Chart</h2>
//                         <hr className="bg-black rounded-full border-none h-0.5 px-4 my-2" />
//                         {/* <div className="mt-4">
//                             {chartData === null ? (
//                                 <div className="flex justify-center items-center h-[20rem]">
//                                     <FourSquare
//                                         color="#181D2A"
//                                         size="medium"
//                                         text=""
//                                         textColor=""
//                                     />
//                                 </div>
//                             ) : (
//                                 <CandlestickChart
//                                     data={chartData.data}
//                                     title={chartData.title}
//                                 />
//                             )}

//                             <div className="flex gap-x-4 m-10">
//                                 <Autocomplete
//                                     options={PeriodOptions}
//                                     onChange={(selectedOption) =>
//                                         setPeriod(selectedOption?.value)
//                                     }
//                                 />
//                                 <Autocomplete
//                                     options={IntervalOptions}
//                                     onChange={(selectedOption) =>
//                                         setInterval(selectedOption?.value)
//                                     }
//                                 />
//                             </div>
//                         </div> */}
//                     </div>
//                 </div>

//                 {/* Bottom right */}
//                 <div className="col-start-4 col-end-6 row-start-3 row-end-13 bg-white rounded-[30px] shadow-dark-md">
//                     <div className="flex flex-col justify-center h-full py-4 px-8">
//                         <p className="text-black text-2xl">Some Data</p>
//                     </div>
//                 </div>
//             </div>
//             {/* <div className="flex gap-x-4 m-10">
//                 <Autocomplete
//                     options={PeriodOptions}
//                     onChange={(selectedOption) =>
//                         setPeriod(selectedOption?.value)
//                     }
//                 />
//                 <Autocomplete
//                     options={IntervalOptions}
//                     onChange={(selectedOption) =>
//                         setInterval(selectedOption?.value)
//                     }
//                 />
//             </div>

//             <div className="">
//                 {chartData === null ? (
//                     <div className="flex justify-center items-center h-[80vh]">
//                         <FourSquare
//                             color="#181D2A"
//                             size="medium"
//                             text=""
//                             textColor=""
//                         />
//                     </div>
//                 ) : (
//                     <CandlestickChart
//                         data={chartData.data}
//                         title={chartData.title}
//                     />
//                 )}
//             </div> */}
//         </div>
//     );
// }
