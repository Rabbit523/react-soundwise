export function getDateArray(start, end, interval) {
  //daily: interval == 1
  const dateArray = [];
  const startDate = start.split('-');
  const endDate = end.split('-');
  let s = new Date(startDate[0], startDate[1] - 1, startDate[2]);
  let e = new Date(endDate[0], endDate[1] - 1, endDate[2]);
  // console.log('end date: ',end, e);
  while (s <= e) {
    dateArray.push(s.toISOString().slice(0, 10));
    s = new Date(s.setDate(s.getDate() + interval));
  }
  return dateArray;
}
