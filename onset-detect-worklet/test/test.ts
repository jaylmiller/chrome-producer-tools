import "mocha";
import algorithm from "../src/odf";
import * as tf from "@tensorflow/tfjs";

it("test", () => {
  const buffer = tf.randomNormal<tf.Rank.R1>([1024]).arraySync();
  algorithm(buffer);
  return;
});
