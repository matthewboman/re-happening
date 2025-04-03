const Instructions = () => {
    return (
      <div>
        <h1 className="mb-4 font-size-lg">How to use INFINITY</h1>

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

      </div>
    )
  }

  export default Instructions