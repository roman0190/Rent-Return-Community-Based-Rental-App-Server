export default function asyncCatch(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // console.log(error)
      next(error);
    }
  };
}
