import { useEffect, useState } from "react";

const Timer = (props: {paused: boolean, reset: boolean}) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (props.reset)
      setTime(0);

    const intervalId = setInterval(() => {
      if (!props.paused)
        setTime(prevTime => prevTime + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [props.reset, props.paused]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time - (hours * 3600)) / 60);
  const seconds = time % 60;

  return (
    <p style={{margin: 0, fontSize: 18, fontWeight: "bold", width: 56}}>
      {hours > 0 && hours + ":"}
      {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </p>
  )
}

export default Timer;