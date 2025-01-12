import dayjs from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';
import utc from 'dayjs/esm/plugin/utc';
dayjs.extend(utc);
dayjs.extend(relativeTime);
export default dayjs;
