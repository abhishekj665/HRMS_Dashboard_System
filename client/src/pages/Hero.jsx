function Hero() {
  return (
    <div
      className="
        w-full 
        w-sm-0
        min-h-screen 
        hidden lg:flex
        md:flex
        
        items-center 
        bg-gray-400
        bg-[url('https://imgs.search.brave.com/ZQYJ0vfbK4uQbPLot6dzxEhRF7zghuD-b_mCJtA-t3c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE2LzY3LzI2LzUz/LzM2MF9GXzE2Njcy/NjUzNzBfenpJUUhX/aEt6OGlJa2J0elNM/YkpDYk1GUUp1RTJw/S3UuanBn')]
        bg-cover 
        bg-center
      "
    >
      <div className="w-full min-h-screen bg-black/40 flex items-center">
        <div className="px-6 sm:px-10 md:px-16 lg:px-20 max-w-2xl">
          <h1
            className="
              text-white 
              font-semibold 
              leading-tight
              text-2xl 
              sm:text-3xl 
              md:text-4xl 
              lg:text-4xl
            "
          >
            Optimize Your Backend.
            <br />
            Elevate Your System.
          </h1>

          <p
            className="
              mt-5 
              text-white 
              text-sm 
              sm:text-base 
              md:text-lg
            "
          >
            Analyze and refine backend code to reduce bottlenecks, improve
            execution flow, and build faster, more reliable server-side
            applications.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;