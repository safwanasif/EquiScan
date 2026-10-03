import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { ScanResult, Addendum, BiasFlag, BiasCategory } from "@/lib/types";
import { BIAS_CATEGORIES } from "@/data/biasCategories";

// Register fonts (uses built-in PDF fonts, no external loading needed)
Font.register({
  family: "Times-Roman",
  src: "Times-Roman",
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#0A0A0A",
    backgroundColor: "#FAFAF7",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 16,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9F1239",
    marginRight: 6,
  },
  logoText: {
    fontSize: 14,
    fontFamily: "Times-Roman",
    letterSpacing: -0.2,
  },
  headerMeta: {
    fontSize: 8,
    color: "#737373",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Times-Roman",
    fontSize: 28,
    lineHeight: 1.3,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    color: "#737373",
    marginBottom: 28,
  },
  gradeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 20,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
  },
  gradeLeft: {
    flex: 1,
  },
  gradeLabel: {
    fontSize: 7,
    color: "#737373",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  gradeLetter: {
    fontFamily: "Times-Roman",
    fontSize: 48,
    color: "#9F1239",
    lineHeight: 1,
  },
  gradeScore: {
    fontSize: 9,
    color: "#737373",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  gradeRight: {
    alignItems: "flex-end",
  },
  flagCount: {
    fontFamily: "Times-Roman",
    fontSize: 36,
    lineHeight: 1,
  },
  sectionLabel: {
    fontSize: 7,
    color: "#737373",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  summaryBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 16,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#262626",
  },
  sectionHeader: {
    fontFamily: "Times-Roman",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  flagCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 10,
  },
  flagHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  flagCategory: {
    fontSize: 7,
    color: "#9F1239",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  flagSeverity: {
    fontSize: 7,
    color: "#737373",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  flagSentence: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  flagExplanation: {
    fontSize: 9,
    color: "#525252",
    marginBottom: 8,
    fontStyle: "italic",
  },
  flagSubLabel: {
    fontSize: 7,
    color: "#737373",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 3,
    marginTop: 8,
  },
  rewriteText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#0A0A0A",
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#9F1239",
    paddingTop: 2,
    paddingBottom: 2,
  },
  citationBox: {
    backgroundColor: "#FAFAF7",
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#D4D4D4",
  },
  citationText: {
    fontSize: 8.5,
    color: "#262626",
    lineHeight: 1.4,
  },
  citationRelevance: {
    fontSize: 8,
    color: "#737373",
    fontStyle: "italic",
    marginTop: 3,
  },
  addendumBox: {
    backgroundColor: "#0A0A0A",
    padding: 20,
    marginTop: 8,
  },
  addendumLabel: {
    fontSize: 7,
    color: "#FAFAF7",
    opacity: 0.6,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  addendumTitle: {
    fontFamily: "Times-Roman",
    fontSize: 20,
    color: "#FAFAF7",
    marginBottom: 6,
  },
  addendumMeta: {
    fontSize: 8,
    color: "#FAFAF7",
    opacity: 0.6,
    marginBottom: 14,
  },
  addendumBody: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: "#FAFAF7",
    lineHeight: 1.7,
  },
  topicsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 4,
  },
  topicChip: {
    fontSize: 7,
    color: "#FAFAF7",
    backgroundColor: "#262626",
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#737373",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

interface ReportPDFProps {
  result: ScanResult;
  addendum?: Addendum | null;
  documentTitle?: string;
  reviewDecisions?: Record<string, string>;
}

export default function ReportPDF({
  result,
  addendum,
  documentTitle,
  reviewDecisions = {},
}: ReportPDFProps) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <View style={styles.logoBlock}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>EquiScan</Text>
          </View>
          <Text style={styles.headerMeta}>Bias Audit Report</Text>
        </View>

        <Text style={styles.title}>Bias Audit Report</Text>
        <Text style={styles.subtitle}>
          {documentTitle ? documentTitle + "  |  " : ""}
          {today}
        </Text>

        <View style={styles.gradeCard}>
          <View style={styles.gradeLeft}>
            <Text style={styles.gradeLabel}>Provisional review grade</Text>
            <Text style={styles.gradeLetter}>{result.letterGrade}</Text>
            <Text style={styles.gradeScore}>
              Bias score {result.documentBiasScore}/10
            </Text>
          </View>
          <View style={styles.gradeRight}>
            <Text style={styles.gradeLabel}>Flags detected</Text>
            <Text style={styles.flagCount}>{result.totalFlags}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Summary</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{result.summary}</Text>
        </View>

        <Text style={styles.summaryText}>AI-generated editorial review; not clinically validated. No findings does not establish that a document is unbiased.</Text>
        <Text style={styles.sectionHeader}>Flagged Passages</Text>
        {result.flags.length === 0 ? <Text style={styles.summaryText}>No candidate passages were flagged in this scan.</Text> : null}

        {result.flags.map((flag: BiasFlag) => {
          const categoryDef =
            BIAS_CATEGORIES[flag.category as BiasCategory];
          return (
            <View key={flag.id} style={styles.flagCard} wrap={false}>
              <View style={styles.flagHeader}>
                <Text style={styles.flagCategory}>
                  {categoryDef ? categoryDef.shortLabel : flag.category}
                </Text>
                <Text style={styles.flagSeverity}>
                  Severity {flag.severity}
                </Text>
              </View>

              <Text style={styles.flagSentence}>
                &ldquo;{flag.flaggedSentence}&rdquo;
              </Text>

              <Text style={styles.flagExplanation}>{flag.explanation}</Text>
              <Text style={styles.flagSubLabel}>Review decision: {reviewDecisions[flag.id] || "open"}</Text>

              <Text style={styles.flagSubLabel}>Suggested Rewrite</Text>
              <Text style={styles.rewriteText}>{flag.suggestedRewrite}</Text>

              {flag.citation ? (
                <View style={styles.citationBox}>
                  <Text style={styles.flagSubLabel}>Grounded in</Text>
                  <Text style={styles.citationText}>
                    {flag.citation.text}
                  </Text>
                  <Text style={styles.citationRelevance}>
                    {flag.citation.relevance}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {addendum ? (
          <View style={styles.addendumBox} wrap>
            <Text style={styles.addendumLabel}>Unverified editorial draft</Text>
            <Text style={styles.addendumTitle}>{addendum.title}</Text>
            <Text style={styles.addendumMeta}>
              {addendum.wordCount} words
            </Text>

            {addendum.topicsCovered && addendum.topicsCovered.length > 0 ? (
              <View style={styles.topicsRow}>
                {addendum.topicsCovered.map((t: string, i: number) => (
                  <Text key={i} style={styles.topicChip}>
                    {t}
                  </Text>
                ))}
              </View>
            ) : null}

            <Text style={styles.addendumBody}>{addendum.content}</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            EquiScan - Built with Groq
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
