package main

import (
	"fmt"
	"sync"

	"gonum.org/v1/gonum/fourier"
	"gonum.org/v1/gonum/mat"
)

const frameSize = 512
const hopSize = 128

func realVals(input []complex128) []float64 {
	arr := make([]float64, len(input))
	for i := 0; i < len(input); i++ {
		arr[i] = real(input[i])
	}
	return arr
}

func getDiffVectors(inVectors []*mat.VecDense) []*mat.VecDense {
	for i := 1; i < len(inVectors); i++ {
		inVectors[i-1].SubVec(inVectors[i], inVectors[i-1])
	}
	return inVectors[0 : len(inVectors)-1]
}

// func getDiffVectors(inVectors []*mat.VecDense) []*mat.VecDense {
// 	for i := 1; i < len(inVectors); i++ {
// 		a := inVectors[i]
// 		b := inVectors[i-1]
// 		inVectors[i-1].SubVec(a, b)
// 	}
// 	return inVectors[0 : len(inVectors)-1]
// }

func OdfSerial(inputBuffer []float64) []float64 {
	numFrames := (len(inputBuffer) - frameSize) / hopSize
	dstLen := frameSize/2 + 1
	fmt.Println("num frames:", numFrames)
	fft := fourier.NewFFT(frameSize)
	fmt.Println(fft)
	fftVectors := make([]*mat.VecDense, numFrames)
	for i := 0; i < numFrames; i++ {
		frame := inputBuffer[i*hopSize : i*hopSize+512]
		dst := make([]complex128, dstLen)
		fft.Coefficients(dst, frame)
		fftVectors[i] = mat.NewVecDense(dstLen, realVals(dst))
	}
	// diffVectors := getDiffVectors(fftVectors)
	return inputBuffer
}

func OdfConcurrent(inputBuffer []float64) []float64 {
	numFrames := (len(inputBuffer) - frameSize) / hopSize
	dstLen := frameSize/2 + 1
	fmt.Println("num frames:", numFrames)
	fft := fourier.NewFFT(frameSize)
	fftVectors := make([]*mat.VecDense, numFrames)
	var wg sync.WaitGroup
	wg.Add(numFrames)
	for i := 0; i < numFrames; i++ {
		go func(i int) {
			frame := inputBuffer[i*hopSize : i*hopSize+512]
			dst := make([]complex128, dstLen)
			fft.Coefficients(dst, frame)
			fftVectors[i] = mat.NewVecDense(dstLen, realVals(dst))
			fmt.Println(i)
			wg.Done()
		}(i)
	}
	wg.Wait()
	fmt.Println("done!")
	fmt.Println(fftVectors)
	diffVectors := getDiffVectors(fftVectors)
	fmt.Println(diffVectors)
	return inputBuffer
}
