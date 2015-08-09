// distribution to create random bits
// copyright 2014 Bettina Heim

#ifndef BITITERATOR_HPP_
#define BITITERATOR_HPP_

#include <vector>
#include <iterator>
#include <limits>
#include "dtsqa_utils.hpp"
#include "bititerator_detail.hpp"


template<class base_type>
class BitIterator {

	private:

		const uint32_t base_type_bitsize;
		const std::vector<base_type>& data;
		std::vector<base_type> mask; // todo: maybe get rid of that mask again... -> watch out; modifications in algorithm.hpp for the case of one cluster needed
		std::pair<size_t, unsigned int> pos;

		void find_next();

		int _ctz(const base_type& arg){
			return bititerator_detail::ctz<base_type>(arg);
		}


	public:

		const std::pair<size_t, unsigned int> END;

		BitIterator(const std::vector<base_type>& data, const std::pair<size_t, unsigned int>& end = std::pair<size_t, unsigned int>(std::numeric_limits<size_t>::max(), sizeof(base_type) * CHAR_BIT))
		: base_type_bitsize(sizeof(base_type) * CHAR_BIT)
		, data(data)
		, mask(data.size() <= end.first? data.size() : end.first + 1, ~static_cast<base_type>(0))
		, pos(0,0)
		, END(std::pair<size_t, unsigned int>(data.size() <= end.first? data.size() - 1 : end.first, end.second)){
			mask.back() ^= (END.second == base_type_bitsize ? 0 : (0ull - (static_cast<base_type>(1) << END.second)));
			find_next();
		}

		std::pair<size_t, unsigned int> operator*() const { return pos;};
		std::pair<size_t, unsigned int> const* operator->() const { return &pos; }

		BitIterator& operator++() { find_next(); return *this;}
		BitIterator operator++(int){
			BitIterator old(*this); ++(*this); return old;}

		bool operator==(BitIterator const& rhs) const { return pos == rhs.pos;}
		bool operator!=(BitIterator const& rhs) const { return !(*this == rhs);}

};

template<class base_type>
void BitIterator<base_type>::find_next(){

	while (pos.first < mask.size() && (data[pos.first] & mask[pos.first]) == 0)
		++pos.first; //mask[pos.first++] = 0; // unnecessary...

	if (pos.first >= mask.size()) {
		pos = END;
		return;
	}
	pos.second = _ctz(data[pos.first] & mask[pos.first]);
	mask[pos.first] &= (- ((static_cast<base_type>(1)<< pos.second) << 1));
}


#endif  /* BITITERATOR_HPP_ */
