export const googleRuns: any = (func: string, ...args: any): Promise<any> =>
  new Promise((resolve, reject) =>
    google.script.run
      .withSuccessHandler((e) => resolve(e))
      .withFailureHandler((e) => reject(e))
    [func](args)
  );
