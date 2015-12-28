#include <cmath>
#include <iostream>

#include <DE.h>
#include <ANN.h>
#include <Counter.h>
#include <TimePeriod.h>
#include <TrainingSet.h>
#include <ModelParameters.h>

using namespace std;

#define DEFAULT_NUMBER_OF_RECOMBINATIONS 10000000L
#define TIME_SERIES_SIZE 31

bool isRunning = true;

long numberOfRecombinations = DEFAULT_NUMBER_OF_RECOMBINATIONS;

void sleep() {
}

void sineDataTest() {
	/*
	 * Collect statistics.
	 */
	Counter counters;

	/*
	 * Form ANN with three layers.
	 */
	ANN ann(&counters, 12, 5, 1, M1);
	ann.setupInput( 5 );
	ann.setupOutput( 1 );
	ann.setupThreeLayers();

	/*
	 * Implement simple rates test case.
	 */
	RateInfo expected;
	std::vector<RateInfo> rates;
	rates.resize(TIME_SERIES_SIZE);
	for(int i=0; i<rates.size(); i++) {
		//TODO May be it should be in the oposite direction.
		rates[i].time = rates.size()-i-1;

		rates[i].open = (1 + sin((double)i/rates.size()*M_PI+M_PI/17.0)) / 2.0;
		rates[i].low = (1 + sin((double)i/rates.size()*M_PI+M_PI/19.0)) / 2.0;
		rates[i].high = (1 + sin((double)i/rates.size()*M_PI+M_PI/23.0)) / 2.0;
		rates[i].close = (1 + sin((double)i/rates.size()*M_PI+M_PI/31.0)) / 2.0;

		rates[i].volume = rand();
	}
	expected.open = (1 + sin((double)TIME_SERIES_SIZE/rates.size()*M_PI+M_PI/17.0)) / 2.0;
	expected.low = (1 + sin((double)TIME_SERIES_SIZE/rates.size()*M_PI+M_PI/19.0)) / 2.0;
	expected.high = (1 + sin((double)TIME_SERIES_SIZE/rates.size()*M_PI+M_PI/23.0)) / 2.0;
	expected.close = (1 + sin((double)TIME_SERIES_SIZE/rates.size()*M_PI+M_PI/31.0)) / 2.0;

	/*
	 * Form training set.
	 */
	TrainingSet ts(rates, rates.size(), 5, 1);

	/*
	 * Link ANN with the training set.
	 */
	ann.setTrainingSetPointer( &ts );

	/*
	 * Initialize DE population.
	 */
	DE de(&counters, &ann, 31);
	Population &population = de.getPopulation();
	for(int i=0; i<population.dimension(); i++) {
		WeightsMatrix weights( ann.getNeurons().dimension() );
		Chromosome chromosome(weights, (double)RAND_MAX);
		population[i] = chromosome;
	}
	population.initRandom();

	de.setPopulation( population );

	/*
	 * Do the training.
	 */
	for(long g=0; g<numberOfRecombinations; g++) {
		de.evolve();

        static int r = 0;
        r = de.getPopulation().getBestFitnessIndex();

		ann.setWeights(de.getPopulation()[r].getWeights());
		ann.gradient();
		de.getPopulation()[r].setWeights(ann.getWeights());
	}

    /*
     * Produce prediction after training.
     */
	ann.setWeights(de.getPopulation()[de.getPopulation().getBestFitnessIndex()].getWeights());
    ann.predict();

	cout << "Next expected value: ";
	cout << "\t";
	cout << (expected.high+expected.low)/2.0;
	cout << endl;
	cout << "Predicted value: ";
	cout << "\t";
	cout << ann.getPrediction();
	cout << endl;

	//cout << "===" << endl;
	//cout << endl;
	//cout << ann << endl;
	//cout << endl;
	//cout << "===" << endl;
	//cout << endl;
	//cout << de << endl;
	//cout << endl;
	//cout << "===" << endl;
	//cout << endl;
	//cout << ts << endl;
	//cout << endl;
	//cout << "===" << endl;
	//cout << endl;
	cout << counters << endl;
	//cout << endl;
	//cout << "===" << endl;
	//cout << endl;
}

int main(const int argc, char **argv) {
	srand( time(NULL) );

    if(argc > 1) {
        sscanf(argv[1], "%ld", &numberOfRecombinations);
    }

    try{
        sineDataTest();
    } catch(const char *exception) {
        cerr << exception;
    }

	return EXIT_SUCCESS;
}
