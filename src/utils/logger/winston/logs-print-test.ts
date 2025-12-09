import baseLogger from './index';

// Test logger function (unused - for testing purposes only)
// This file is for testing logger functionality and is not used in production
// @ts-ignore - Function is exported for potential future testing
export function _testLogger(): void {
    let nn = 12355
    baseLogger.info('String Test:', 'This is a string');
    baseLogger.info('Number Test:', nn);
    baseLogger.info('Boolean Test:', true);
    baseLogger.info('Null Test:', null);
    baseLogger.info('Undefined Test:', undefined); // Should not throw errors but might log as empty
    baseLogger.info('Simple Array Test:', [1, 2, 3, 4, 5]);
    baseLogger.info('Nested Array Test:', [1, [2, [3, [4, 5]]]]);
    baseLogger.info('Mixed Array Test:', [1, 'string', true, null, { key: 'value' }]);
    baseLogger.info('Simple Object Test:', { key1: 'value1', key2: 'value2' });
    baseLogger.info('Nested Object Test:', { level1: { level2: { level3: 'deepValue' } } });
    baseLogger.info('Object with Array Test:', { key: [1, 2, 3], anotherKey: 'value' });
    const circularObj: any = { name: 'Circular Object' };
    circularObj.self = circularObj; // Create circular reference
    baseLogger.info('Circular Object Test:', circularObj);
    
    const complexObj = {
      a: 1,
      b: [1, 2, { c: 3 }],
      d: { e: 'nested', f: [4, 5, 6] },
    };
    baseLogger.info('Complex Object Test:', complexObj);
    
    
    try {
      throw new Error('This is a test error');
    } catch (err) {
      baseLogger.error('Error Object Test:', err);
    }
    
    baseLogger.error('String Error Test:', 'This is a string error');
    
    const customError = new Error('Custom Error Message');
    customError.name = 'CustomError';
    baseLogger.error('Custom Error Test:', customError);
    
    try {
      // Simulate an unhandled error
      JSON.parse('INVALID_JSON');
    } catch (err) {
      baseLogger.error('Unhandled Error:', err);
    }
    
    baseLogger.info('Special Characters Test:', 'String with special characters: !@#$%^&*()_+[]{}|;:",.<>?/~`');
    baseLogger.info('Unicode String Test:', 'Unicode characters: こんにちは世界');
    
    
    const promise = Promise.resolve('Resolved Value');
    baseLogger.info('Promise Test:', promise);
    
    promise.then((result) => {
      baseLogger.info('Promise Resolved Test:', result);
    });
    
    const rejectedPromise = Promise.reject(new Error('Rejected Promise'));
    rejectedPromise.catch((err) => {
      baseLogger.error(`Promise Rejected Test: ${err}`);
    });
}
    
//testLogger()