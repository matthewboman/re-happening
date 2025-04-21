const Guide = () => (
  <div className="bg-slate-950 text-teal-100">
    <div className="max-w-7xl mx-auto py-4 px-8">
      <h1 className="text-3xl font-semibold">How to participate</h1>
      <div className="my-[2rem]">
        <h2 className="text-xl mb-1 font-semibold">
          &#8594; Create your track
        </h2>
        <p className="text-lg px-2">
          Record your track directly to the site.
          Make sure you allow access to your phone's microphone.
        </p>
      </div>
      <div className="my-[2rem]">
        <h2 className="text-xl mb-1 font-semibold">
          &#8594; Name and save it to share with the world
        </h2>
        <p className="text-lg px-2">
          Once you have a track you like, submit it.
          If you want to be credited, add your name.
          If you want to get updates on the project or create
          a remix for our compilation, add your email too.
        </p>
        <p className="text-lg px-2">
          Your track will now be at the top of the stack.
        </p>
      </div>
      <div className="my-[2rem]">
        <h2 className="text-xl mb-1 font-semibold">
          &#8594; Play the existing composition
        </h2>
        <p className="text-lg px-2">
          Anyone can decide which tracks are or aren't playing.
          Click 'Play composition' to hear which tracks others
          have decided go together.
        </p>
        <p className="text-lg px-2">
          Turn other tracks on or off as you wish.
        </p>
      </div>
      <div className="my-[2rem]">
        <h2 className="text-xl mb-1 font-semibold">
          &#8594; Remix tracks
        </h2>
        <p className="text-lg px-2">
          There are many ways to manipulate the tracks:
        </p>
        <div className="my-8">
          <h2 className="mb-2">Volume</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <img src="./images/envelope.gif"/>
            </div>
            <div>
              You can automate volume. Click on the line to create a new node.
              Click and drag nodes up/down to adjust the volume.
            </div>
          </div>
        </div>

        <hr className='white'/>

        <div className="my-8">
          <h2 className="mb-2">Loops</h2>
          <div className="grid grid-cols-2 gap-4">
            <img src="./images/loop.gif" />
            <div>
              Click and drag to determine when a loop starts and stops.
              You can also drag the entire loop.
            </div>
          </div>
        </div>

        <hr className='white'/>

        <div className="my-8">
          <h2 className="mb-2">Speed</h2>
          <div className="grid grid-cols-2 gap-4">
            <img src="./images/speed.gif" />
            <div>
              You can adjust the speed of the loop making it up to 4x faster/slower.
              <br/>
              Un-check "preserve pitch" to make the loop behave like changing the speed of a tape.
            </div>
          </div>
        </div>
        <p className="text-lg">
          Don't forget to save!
        </p>
      </div>
    </div>
  </div>
)

export default Guide