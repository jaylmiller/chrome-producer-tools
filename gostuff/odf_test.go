package main

// import (
// 	"testing"
// 	"time"

// 	"github.com/stretchr/testify/assert"
// 	"gonum.org/v1/gonum/mat"
// )

// func fillVec(vec *mat.VecDense, val float64) {
// 	for i := 0; i < vec.Len(); i++ {
// 		vec.SetVec(i, val)
// 	}
// }

// func vecEquals(vec1 *mat.VecDense, vec2 *mat.VecDense) bool {
// 	for i := 0; i < vec1.Len(); i++ {
// 		if vec1.AtVec(i) != vec2.AtVec(i) {
// 			return false
// 		}
// 	}
// 	return true
// }

// func TestDiffVectors(t *testing.T) {
// 	vecs := make([]*mat.VecDense, 3)
// 	for i := 0; i < 3; i++ {
// 		vecs[i] = mat.NewVecDense(12, nil)
// 		fillVec(vecs[i], float64(i+1))
// 	}
// 	diffs := getDiffVectors(vecs)
// 	for i := 0; i < 2; i++ {
// 		t.Log(diffs[i])
// 	}
// 	assert.True(t, vecEquals(diffs[0], vecs[0]))
// 	assert.True(t, vecEquals(diffs[1], vecs[0]))
// }

// func TestOdfWorks(t *testing.T) {
// 	inputBuff := make([]float64, 4096)
// 	start := time.Now().UnixNano()
// 	OdfConcurrent(inputBuff)
// 	t.Log("time: ", time.Now().UnixNano()-start)
// 	start = time.Now().UnixNano()
// 	OdfSerial(inputBuff)
// 	t.Log("time: ", time.Now().UnixNano()-start)
// }
