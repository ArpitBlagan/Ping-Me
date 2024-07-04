import * as flatbuffers from 'flatbuffers';
export declare class Binary implements flatbuffers.IUnpackableObject<BinaryT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): Binary;
    static getRootAsBinary(bb: flatbuffers.ByteBuffer, obj?: Binary): Binary;
    static getSizePrefixedRootAsBinary(bb: flatbuffers.ByteBuffer, obj?: Binary): Binary;
    value(index: number): number | null;
    valueLength(): number;
    valueArray(): Uint8Array | null;
    static startBinary(builder: flatbuffers.Builder): void;
    static addValue(builder: flatbuffers.Builder, valueOffset: flatbuffers.Offset): void;
    static createValueVector(builder: flatbuffers.Builder, data: number[] | Uint8Array): flatbuffers.Offset;
    static startValueVector(builder: flatbuffers.Builder, numElems: number): void;
    static endBinary(builder: flatbuffers.Builder): flatbuffers.Offset;
    static createBinary(builder: flatbuffers.Builder, valueOffset: flatbuffers.Offset): flatbuffers.Offset;
    unpack(): BinaryT;
    unpackTo(_o: BinaryT): void;
}
export declare class BinaryT implements flatbuffers.IGeneratedObject {
    value: (number)[];
    constructor(value?: (number)[]);
    pack(builder: flatbuffers.Builder): flatbuffers.Offset;
}
//# sourceMappingURL=binary.d.ts.map