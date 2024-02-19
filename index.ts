

async function process() {
  const start = Bun.nanoseconds();
  
  const weatherMap = new Map<string, Array<number>>();
  const file = Bun.file("measurements.txt");
  const text = await file.text();

  const textProcess = text.split("\n").map((line: string, index: number) => {
    return new Promise((res, _rej) => {
      console.log(line);
      if (line.startsWith('#')) {
        res(true);
        return;
      }
      const parts = line.split(";");
      const station = parts[0];
      const temperature = parseFloat(parts[1]);

      if (weatherMap.has(station)) {
        const prevTemp = weatherMap.get(station);
        weatherMap.set(station, [...prevTemp!, temperature])
      } else {
        weatherMap.set(station, [temperature]);
      }

      res(true);
    })
  });

  await Promise.all(textProcess);

  console.log('Map key/values: ', weatherMap.entries().next().value);


  const finalResult: { [key: string]: string } = {};

  const calcProcess = Array.from(weatherMap.keys()).map(key => {
    return new Promise((res) => {
      const temperatures = weatherMap.get(key);
      const min = Math.min(...temperatures!);
      const mean = temperatures!.reduce((a, b) => a + b, 0) / temperatures!.length;
      const max = Math.max(...temperatures!);
      finalResult[key] = `${min.toFixed(2)}/${mean.toFixed(2)}/${max.toFixed(2)}`;
      res(true);
    })
  })

  await Promise.all(calcProcess);

  console.log(JSON.stringify(finalResult, null, 2))

  console.log('Map size: ', weatherMap.size);

  const end = Bun.nanoseconds();
  console.log('Elapsed time: ', nanosecondsToSeconds(end - start));
}

function nanosecondsToSeconds(nanoseconds: number) {
  return nanoseconds / 1e9;
}

process();
