export default function Dashboard() {
    return (
        <div className="bg-light">
            {/* I need to Create a layout and render my dashboard inside this layout along with the navbar positioned at the top!!! */}

            <div className="w-[90%] mx-auto flex flex-col justify-center h-[100vh]">
                <div className="h-[10%] bg-white rounded-[30px] shadow-md px-6 mb-6">
                    {/* Search bar component? */}
                    <p className="text-dark">Search Bar</p>
                </div>

                <div className="grid grid-cols-12-5 h-[70%]">
                    <div className="content-between mr-6">
                        <div className="h-[58%] bg-white rounded-[30px] shadow-md px-6 mb-6">
                            <h2 className="text-dark">Latest News</h2>
                        </div>

                        <div className="h-[40%] bg-white rounded-[30px] shadow-md px-6">
                            <h2 className="text-dark">Market Indexes</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] shadow-md px-6">
                        <p className="text-dark">Trending</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
