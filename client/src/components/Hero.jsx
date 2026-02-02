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
        bg-[url('https://imgs.search.brave.com/N8Lj7B9fG5lTZuspuF8K5CaEA4vbgIb8nyl6H62tsvE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTU5/NDA1MDk4OS92ZWN0/b3IvYmxhY2stYW5k/LXdoaXRlLWJsYW5r/LXBvc3RlcnMtaGFu/Z2luZy13aXRoLXBh/cGVyLWNsaXBzLWE0/LXBhcGVyLXBhZ2Ut/c2hlZXQtb24td2Fs/bC5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9NktPWkg4VXZY/ZloxR1U2ZEozQ1Yz/RnBTX1JibGZ0TFJI/a050ZkFPSnhpMD0')]
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
            Embrace Excellence
            <br />
            in Dashboard Development
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
            Unlock the potential of Dashboard, where developers craft
            meticulously structured, visually stunning dashboards with
            feature-rich modules. Join us today to shape the future of your
            application development.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
