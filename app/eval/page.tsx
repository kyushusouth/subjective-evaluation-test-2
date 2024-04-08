"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import EvalForm from "@/app/eval/form";
import Confirm from "@/app/eval/confirm";
import { SchemaType } from "@/app/eval/schema";
import {
  SampleMetaData,
  NaturalnessItem,
  IntelligibilityItem,
  Respondents,
} from "@prisma/client";

export default function Page() {
  const methods = useForm<SchemaType>({
    mode: "onBlur",
  });
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [sampleMetaDataList, setSampleMetaDataList] = useState<
    SampleMetaData[]
  >([]);
  const [domainName, setDomainName] = useState<string>("");
  const [bucketName, setBucketName] = useState<string>("");
  const [naturalnessItemList, setNaturalnessItemList] = useState<
    NaturalnessItem[]
  >([]);
  const [intelligibilityItemList, setintelligibilityItemList] = useState<
    IntelligibilityItem[]
  >([]);
  const [respondent, setRespondent] = useState<Respondents | undefined>();
  const numSamplePerPage = 10;
  const lastPageNumber = Math.ceil(
    sampleMetaDataList.length / numSamplePerPage,
  );

  const onNext = () => {
    setPageNumber((state) => state + 1);
  };

  const onPrev = () => {
    setPageNumber((state) => state - 1);
  };

  useEffect(() => {
    let ignore = false;
    const fetchSampleMetaData = async () => {
      const res = await fetch("api/sampleMetaData", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await res.json();
      if (!ignore) {
        setSampleMetaDataList(data);
      }
    };

    const fetchDomainName = async () => {
      const res = await fetch("api/domainName", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await res.json();
      if (!ignore) {
        setDomainName(data);
      }
    };

    const fetchBucketName = async () => {
      const res = await fetch("api/bucketName", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await res.json();
      if (!ignore) {
        setBucketName(data);
      }
    };

    const fetchNaturalnessItem = async () => {
      const res = await fetch("api/naturalnessItem", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await res.json();
      if (!ignore) {
        setNaturalnessItemList(data);
      }
    };

    const fetchIntelligibilityItem = async () => {
      const res = await fetch("api/intelligibilityItem", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await res.json();
      if (!ignore) {
        setintelligibilityItemList(data);
      }
    };

    const fetchRespondent = async () => {
      const res = await fetch("api/respondent", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });
      const data = await res.json();
      if (!ignore) {
        setRespondent(data);
      }
    };

    fetchSampleMetaData();
    fetchDomainName();
    fetchBucketName();
    fetchNaturalnessItem();
    fetchIntelligibilityItem();
    fetchRespondent();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...methods}>
      <form>
        {pageNumber === lastPageNumber + 1 ? (
          <Confirm
            onPrev={onPrev}
            sampleMetaDataList={sampleMetaDataList}
            respondent={respondent}
          />
        ) : (
          <EvalForm
            onNext={onNext}
            onPrev={onPrev}
            sampleMetaDataList={sampleMetaDataList.slice(
              numSamplePerPage * (pageNumber - 1),
              numSamplePerPage * pageNumber,
            )}
            domainName={domainName}
            bucketName={bucketName}
            naturalnessItemList={naturalnessItemList}
            intelligibilityItemList={intelligibilityItemList}
            pageNumber={pageNumber}
          />
        )}
      </form>
    </FormProvider>
  );
}
