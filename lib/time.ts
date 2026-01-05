import { headers } from 'next/headers'

export async function getCurrentTimeMs(): Promise<number> {
    if (process.env.TEST_MODE === '1') {
        const headersList = await headers()
        const testNow = headersList.get('x-test-now-ms')
        if (testNow) {
            const parsed = parseInt(testNow, 10)
            if (!isNaN(parsed)) {
                return parsed
            }
        }
    }
    return Date.now()
}
