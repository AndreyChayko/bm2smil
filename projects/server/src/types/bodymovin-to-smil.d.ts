declare module 'bodymovin-to-smil' {
  /**
   * Converts a Lottie/Bodymovin JSON object to an animated SVG (SMIL) string.
   *
   * Note: Upstream package does not ship TypeScript types. This local declaration
   * provides a minimal signature to enable type-checking in our server code.
   */
  export default function bodymovinToSmil(json: unknown): Promise<string>;
}
