/**
 * @classdesc
 * CIDR library
 *
 * **PURPOSE**:  Provides methods for working with CIDRs.
 *
 * The key methods it provides are:
 *
 * * `doSubnetsOverlap()` - Pass it two subnet strings, and it tells you whether they overlap
 * * `sortCidrByBinary()` - Use this as your sort function's callback and you can sort subnets by their binary representation
 *
 * Another public method some may find useful is:
 *
 * * `getBinaryRepresentation()` - Returns the binary representation of a CIDR string.
 *
 * A CIDR is a Classless Inter-Domain Routing address.  See https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing.
 *
 * In a bit more detail, a CIDR is an IP address with an optional range suffix appended after a forward slash.  The range is
 * the number of digits (bits, counted from left to right) in the binary representation of the IP address to count as part of
 * that CIDR's prefix. When the range suffix is present, only the prefix (and not the rest of the IP address's) digits are
 * considered to be significant.  The result is the prefix represents a range of IP addresses, which is called a subnet.
 *
 * **USAGE**:
 *
 * To use this library, import and instantiate the `Cidr` class, then call the`doSubnetsOverlap` method with two CIDRs,
 * like this:
 *
 * ```javascript
 * import { Cidr } from './cidr.js';
 *
 * let cidr = new Cidr();
 *
 * let overlaps = cidr.doSubnetsOverlap('11.1.1.2/21', '11.1.1.1/20');
 * ```
 *
 * Note:  In the future I might use a different library in the app for which I wrote this one.  A couple far more full-featured
 * libraries are below:
 *
 * * [https://github.com/whitequark/ipaddr.js](https://github.com/whitequark/ipaddr.js)
 * * [https://github.com/beaugunderson/ip-address](https://github.com/beaugunderson/ip-address)
 *
 */


  /**
   * Determine if the new subnet overlaps the existing subnet
   *
   * @param {string} first_cidr The first CIDR to compare
   * @param {string} second_cidr The second CIDR to compare
   * @returns {boolean}
   */
  function doSubnetsOverlap (first_cidr, second_cidr) {

    // Convert subnets to their IP addresses' binary representations, truncated to the
    //  shortest of their two CIDR prefix lengths
    const prefixes_array = this._getPrefixesOfShortestEqualLength(first_cidr, second_cidr);

    // Compare the two prefixes
    return (prefixes_array[0] === prefixes_array[1]);

  }

  /**
   * Convert subnets to their IP addresses' binary representations, truncated to the
   * shortest of their two CIDR prefix lengths
   *
   * @param {string} first_cidr The first CIDR from which to get a prefix
   * @param {string} second_cidr The second CIDR from which to get a prefix
   * @returns {array} An array containing the binary representations of the two input CIDRs, truncated to the shortest of their two prefix lengths
   */
   function _getPrefixesOfShortestEqualLength (first_cidr, second_cidr) {

    const shortest_prefix_length = Math.min(this._getPrefixLength(first_cidr), this._getPrefixLength(second_cidr));
    const first_binary_prefix = this._getBinaryPrefix(first_cidr, shortest_prefix_length);
    const second_binary_prefix = this._getBinaryPrefix(second_cidr, shortest_prefix_length);

    return [first_binary_prefix, second_binary_prefix];
  }

  /**
   * Convert one subnet to the binary representation of its IP address, truncated to its
   *  CIDR prefix length.  If the cidr is incomplete or specifies no prefix length,
   *  assume it is the left-most portion of the CIDR, and consider its binary length to
   *  be its prefix_length.
   *
   * @param {string} cidr The CIDR whose binary prefix should be returned
   * @param {number} prefix_length The integer length of the CIDR's binary prefix
   * @returns {string} The CIDR's binary prefix
   */
  function _getBinaryPrefix (cidr, prefix_length) {

    const binary_classes = this.getBinaryRepresentation(cidr);

    // Handle incomplete cidr
    if (binary_classes.length < 32 && cidr.indexOf('/') === -1){
      prefix_length = binary_classes.length;
    }

    // Truncate string to prefix length
    const binary_prefix = binary_classes.substring(0, prefix_length);
    return binary_prefix;

  }

  /**
   * Get the CIDR's binary representation including both its prefix and suffix
   *
   * @param {string} cidr The CIDR whose binary representation should be returned
   * @returns {string} The CIDR's binary representation
   */
  function getBinaryRepresentation (cidr) {

    // Get classes as an array
    var classes = this._getClasses(cidr);

    // Convert classes to binary, and join the classes into one string
    const binaryClassesString = classes.map(function(decimal){
      const unpadded = parseInt(decimal, 10).toString(2);
      const pad = '00000000';
      const padded = pad.substring(0, pad.length - unpadded.length) + unpadded;
      return padded;
    }).join('');

    return binaryClassesString;

  }

  /**
   * Get the CIDR's prefix length as an integer. Handle incomplete cidrs by counting their binary
   * length as their prefix_length.
   *
   * @param {string} cidr The CIDR whose prefix length should be returned
   * @returns {number} The CIDR's prefix length as an integer
   */
  function _getPrefixLength (cidr) {
    return cidr.indexOf('/') !== -1 ? parseInt(cidr.split('/')[1], 10) : this._getBinaryPrefix(cidr).length;
  }

  /**
   * Get the CIDR's classes as an array of classes
   *
   * @param {string} cidr The CIDR whose classes should be returned
   * @returns {array} An array of the classes in the CIDR
   */
 function _getClasses (cidr) {
    return cidr.split('/')[0].split('.');
  }

  /**
   * Sort CIDRs by their binary representation
   *
   * @param {string} a The first CIDR to sort
   * @param {string} b The second CIDR to sort
   * @returns {number} 1 means sort a before b; 0 means they sort to the same level; -1 means sort a after b
   */
  function sortCidrByBinary (a, b) {

    const a_bin = this.getBinaryRepresentation(a);
    const b_bin = this.getBinaryRepresentation(b);

    // Compare as strings (to handle integers bigger than 2^53)
    let a_string = String(a_bin, 10);
    let b_string = String(b_bin, 10);

    let out;

    if (a_string > b_string) {
      out = 1;
    } else if (a_string === b_string) {
      out = 0;
    } else if (a_string < b_string) {
      out = -1;
    }

    return out;

  }
