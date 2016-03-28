/*******************************************************************************
 *                                                                             *
 * VitoshaTrade is Distributed Artificial Neural Network trained by            *
 * Differential Evolution for prediction of Forex. Project development is in   *
 * Sofia, Bulgaria. Vitosha is a mountain massif, on the outskirts of Sofia,   *
 * the capital of Bulgaria.                                                    *
 *                                                                             *
 * Copyright (C) 2008-2011 by Todor Balabanov  ( tdb@tbsoft.eu )               *
 *                            Iliyan Zankinski ( iliyan_mf@abv.bg )            *
 *                            Galq Cirkalova   ( galq_cirkalova@abv.bg )       *
 *                            Ivan Grozev      ( ivan.iliev.grozev@gmail.com ) *
 *                            Daniel Chutrov   ( d.chutrov@gmail.com )         *
 *                                                                             *
 * This program is free software: you can redistribute it and/or modify        *
 * it under the terms of the GNU General Public License as published by        *
 * the Free Software Foundation, either version 3 of the License, or           *
 * (at your option) any later version.                                         *
 *                                                                             *
 * This program is distributed in the hope that it will be useful,             *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of              *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               *
 * GNU General Public License for more details.                                *
 *                                                                             *
 * You should have received a copy of the GNU General Public License           *
 * along with this program. If not, see <http://www.gnu.org/licenses/>.        *
 *                                                                             *
 ******************************************************************************/

/**
 * Floating point factor to convert from floating point to integer.
 */
const FLOATING_POINT_FACTOR = 10000.0;

/**
 * Artificial neural network training set.
 *
 * @author Daniel Chutrov
 *
 * @email d.chutrov@gmail.com
 *
 * @date 19 Dec 2010
 */
function TrainingSet(rates, size, past, future) {
	/**
	 * Split number digits in separate double values. Devide each double value by 10.
	 *
	 * @param values Output values array.
	 *
	 * @param size Available array cells for number splitting.
	 *
	 * @param number Number to be split.
	 *
	 * @author Daniel Chutrov
	 *
	 * @email d.chutrov@gmail.com
	 *
	 * @date 23 Dec 2010
	 */
	this.splitDigits = function(values, size, number) {
		for (var i = size - 1; i >= 0; i--) {
			values[i] = ((number % 10) / 10.0);
			number /= 10;
		}
	};

	/**
	 * Merge number digits in sigle number value. Multiply each double value by 10.
	 *
	 * @param values Input values array.
	 *
	 * @param size Array cells of number to merge.
	 *
	 * @return Merged number.
	 *
	 * @author Daniel Chutrov
	 *
	 * @email d.chutrov@gmail.com
	 *
	 * @date 23 Dec 2010
	 */
	this.mergeDigits = function(values, size) {
		var result = 0.0;
		var multiplier = 1.0;

		/*
		 * Plus 0.5 is for rounding.
		 */
		for (var i = size - 1; i >= 0; i--) {
			result += Math.floor((values[i] * 10.0 + 0.5) * multiplier);
			multiplier *= 10;
		}

		return result;
	};

	/**
	 * Check for specific time record.
	 *
	 * @return True if time record is found, false otherwise.
	 *
	 * @author Daniel Chutrov
	 *
	 * @email d.chutrov@gmail.com
	 *
	 * @date 23 Dec 2010
	 */
	this.isTimeFound = function(time) {
		/*
		 * Left side is the begining. Right side is the end.
		 */
		var left = 0;
		var right = size - 1;
		var middle;

		/*
		 * Binary search.
		 */
		do {
			middle = (left + right) / 2;
			if (this.rates[middle].time == time) {
				return (true );
			} else if (left >= right) {
				return (false );
			} else if (time < this.rates[middle].time) {
				right = middle - 1;
			} else if (time > this.rates[middle].time) {
				left = middle + 1;
			}
		} while ( true );

		return (false );
	};

	/**
	 * Load splitted digits.
	 *
	 * @param past How many bars in the past.
	 *
	 * @param future How many bars in the future.
	 *
	 * @author Todor Balabanov
	 *
	 * @email todor.balabanov@gmail.com
	 *
	 * @date 12 Aug 2015
	 */
	this.splitData = function(past, future) {
		var j = 0;
		for (var i = future; i < rates.length - past; i++, j++) {
			examples[j].inputted = getBarsInPast(i, past);
			examples[j].expected = getBarsInFuture(i + 1, future);
			examples[j].predicted = getBarsInFuture(i + 1, future);
		}

		/*
		 * Examples are less than the historical bars. Reduction is according future window size.
		 */
		examples = examples.slice(0, j);
	};

	/**
	 * Load splitted digits.
	 *
	 * @author Daniel Chutrov
	 *
	 * @email d.chutrov@gmail.com
	 *
	 * @date 20 Dec 2010
	 */
	this.splitData = function() {
		for (var i = 0; i < size; i++) {
			splitDigits(examples[i].time, examples.NUMBER_OF_INPUT_SPLIT_DIGITS, rates[i].time);

			//TODO Some mechanisum of changing predicted value should be implemented.
			splitDigits(examples[i].expected, examples.NUMBER_OF_OUTPUT_SPLIT_DIGITS, (FLOATING_POINT_FACTOR * (rates[i].open + rates[i].close) / 2.0));
		}
	};

	/**
	 * Parallel arrays size getter.
	 *
	 * @return Arrays size.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 06 Apr 2009
	 */
	this.getSize = function() {
		return examples.length;
	};

	/**
	 * Rates pointer getter.
	 *
	 * @return Rates pointer.
	 *
	 * @author Todor Balabanov
	 *
	 * @email todor.balabanov@gmail.com
	 *
	 * @date 23 Sep 2009
	 */
	this.getRates = function() {
		return rates;
	};

	/**
	 * Open price at index getter.
	 *
	 * @return Open price at index.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 06 Apr 2009
	 */
	this.getOpen = function(index) {
		if (index >= 0 && index < rates.length) {
			return (rates[index].open );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/**
	 * Close price at index getter.
	 *
	 * @return Close price at index.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 06 Apr 2009
	 */
	this.getClose = function(index) {
		if (index >= 0 && index < rates.length) {
			return (rates[index].close );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/**
	 * Highest price at index getter.
	 *
	 * @return Highest price at index.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 08 Apr 2009
	 */
	this.getHigh = function(index) {
		if (index >= 0 && index < rates.length) {
			return (rates[index].high );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/**
	 * Lowest price at index getter.
	 *
	 * @return Lowest price at index.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 08 Apr 2009
	 */
	this.getLow = function(index) {
		if (index >= 0 && index < rates.length) {
			return (rates[index].low );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/**
	 * UNIX time at index getter.
	 *
	 * @return UNIX time at index.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 08 Apr 2009
	 */
	this.getTime = function(index) {
		if (index >= 0 && index < rates.length) {
			return (rates[index].time );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/**
	 * Amount bars in the past from the index.
	 *
	 * @param index Starting point.
	 *
	 * @param amount How many bars in the past.
	 *
	 * @return Values of bars.
	 *
	 * @author Todor Balabanov
	 *
	 * @email todor.balabanov@gmial.com
	 *
	 * @date 12 Aug 2015
	 */
	this.getBarsInPast = function(index, amount) {
		//TODO Implement ANNIO structure.
		result = new Array(amount);

		if (index + amount > rates.length) {
			//TODO Report exception.
			return;
		}

		for (var i = 0; i < amount; i++) {
			//TODO Some mechanisum of changing predicted value should be implemented.
			result[i] = (rates[index + i].high + rates[index + i].low) / 2;
		}

		return result;
	};

	/**
	 * Amount bars in the future from the index.
	 *
	 * @param index Starting point.
	 *
	 * @param amount How many bars in the future.
	 *
	 * @return Values of bars.
	 *
	 * @author Todor Balabanov
	 *
	 * @email todor.balabanov@gmial.com
	 *
	 * @date 12 Aug 2015
	 */
	this.getBarsInFuture = function(index, amount) {
		//TODO Implement ANNIO structure.
		result = new Array(amount);

		if (index - amount < 0) {
			//TODO Report exception.
			return;
		}

		for (var i = 0; i < amount; i++) {
			//TODO Some mechanisum of changing predicted value should be implemented.
			result[i] = (rates[index - i].high + rates[index - i].low) / 2;
		}

		return result;
	};

	/**
	 * UNIX time at index pointer getter.
	 *
	 * @return UNIX time at index pointer.
	 *
	 * @author Todor Balabanov
	 *
	 * @email todor.balabanov@gmail.com
	 *
	 * @date 09 Sep 2009
	 */
	this.getSplittedInputted = function(index) {
		if (index >= 0 && index < rates.length) {
			return (examples[index].inputted );
		} else {
			//TODO Do better exception handling.
			return [];
		}
	};

	/**
	 * Expected value at index pointer getter.
	 *
	 * @return Expected value at index pointer.
	 *
	 * @author Todor Balabanov
	 *
	 * @email todor.balabanov@gmail.com
	 *
	 * @date 09 Sep 2009
	 */
	this.getSplittedExpected = function(index) {
		if (index >= 0 && index < rates.length) {
			return (examples[index].expected );
		} else {
			//TODO Do better exception handling.
			return [];
		}
	};

	/**
	 * Predicted value at index pointer getter.
	 *
	 * @return Predicted value at index pointer.
	 *
	 * @author Todor Balabanov
	 *
	 * @email todor.balabanov@gmail.com
	 *
	 * @date 09 Sep 2009
	 */
	this.getSplittedPredicted = function(index) {
		if (index >= 0 && index < rates.length) {
			return examples[index].predicted;
		} else {
			//TODO Do better exception handling.
			return [];
		}
	};

	/**
	 * Array index at moment in time getter.
	 *
	 * @param atMoment UNIX timestamp value.
	 *
	 * @return Array index at specific time moment.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 09 Apr 2009
	 */
	this.getIndexAtTime = function(atMoment) {
		/*
		 * Left side is the begining. Right side is the end.
		 */
		var left = 0;
		var right = rates.length - 1;
		var middle;

		/*
		 * Binary search.
		 */
		do {
			middle = (left + right) / 2;

			if (rates[middle].time == atMoment) {
				return (middle );
			} else if (left >= right) {
				return (-1 );
			} else if (atMoment < rates[middle].time) {
				right = middle - 1;
			} else if (atMoment > rates[middle].time) {
				left = middle + 1;
			}
		} while ( true );

		return -1;
	};

	/**
	 * Open price at moment in time getter.
	 *
	 * @return Open price at moment in time.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 09 Apr 2009
	 */
	this.getOpen2 = function(atMoment) {
		var index = getIndexAtTime(atMoment);

		if (index >= 0) {
			return (rates[index].open );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}

	};

	/**
	 * Close price at moment in time getter.
	 *
	 * @return Close price at moment in time.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 09 Apr 2009
	 */
	this.getClose2 = function(atMoment) {
		var index = getIndexAtTime(atMoment);

		if (index >= 0) {
			return (rates[index].close );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/**
	 * Highest price at moment in time getter.
	 *
	 * @return Highest price at moment in time.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 21 Apr 2009
	 */
	this.getHigh2 = function(atMoment) {
		var index = getIndexAtTime(atMoment);

		if (index >= 0) {
			return (rates[index].high );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/**
	 * Lowest price at moment in time getter.
	 *
	 * @return Lowest price at moment in time.
	 *
	 * @author Galq Cirkalova
	 *
	 * @email galq_cirkalova@abv.bg
	 *
	 * @date 21 Apr 2009
	 */
	this.getLow2 = function(atMoment) {
		var index = getIndexAtTime(atMoment);

		if (index >= 0) {
			return (rates[index].low );
		} else {
			//TODO Do better exception handling.
			return (0 );
		}
	};

	/*
	 * It is not possible arrays size to be negative number.
	 */
	if (size < 0) {
		size = 0;
	}

	/**
	 * Array with training examples.
	 */
	this.rates = new Array(size);

	/**
	 * Array with training examples.
	 */
	this.examples = new Array(size);

	/*
	 * Array revers because of MetaTrader 4 data presentation.
	 */
	for ( i = 0; i < size; i++) {
		this.rates[i] = rates[size - i - 1];
		this.examples[i] = new TrainingExample();
	}

	splitData(past, future);
}
