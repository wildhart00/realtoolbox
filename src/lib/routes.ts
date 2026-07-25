/**
 * Shared route helpers.
 *
 * The free Deal Screen is the site's primary conversion. It needs an account but
 * no payment, so signed-out visitors get routed through signup and land straight
 * on the skill with the copy action armed. Every CTA that points at the free Deal
 * Screen should use this helper so the behaviour stays identical everywhere.
 */
export function freeDealScreenPath(isSignedIn: boolean): string {
  return isSignedIn
    ? "/toolbox/deal-screen"
    : "/auth?mode=signup&next=" + encodeURIComponent("/toolbox/deal-screen?copy=1");
}
