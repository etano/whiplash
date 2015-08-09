/*
 * bititerator_detail.hpp
 *
 *  Created on: May 3, 2015
 *      Author: bettina
 */

#ifndef BITITERATOR_DETAIL_HPP_
#define BITITERATOR_DETAIL_HPP_

namespace bititerator_detail {
    template <class base_type>
    int ctz(base_type arg);

    template<> int ctz (uint32_t arg) {
    	return __builtin_ctz(arg);
    }

    template<> int ctz (uint64_t arg) {
    	return __builtin_ctzll(arg);
    }
}

#endif /* BITITERATOR_DETAIL_HPP_ */
