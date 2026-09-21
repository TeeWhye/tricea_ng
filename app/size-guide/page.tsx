import Link from "next/link";

export default function SizeGuidePage() {
  return (
    <main className="size-guide-page">
      <section className="size-guide-hero">
        <p className="size-guide-eyebrow">TRICEA NG</p>
        <h1>Find your perfect fit.</h1>
        <p>
          A simple guide to help you choose the right size before placing
          your order.
        </p>
      </section>

      <section className="size-guide-content">
        <div className="size-guide-intro">
          <p className="size-guide-label">SIZE GUIDE</p>
          <h2>Measure once. Step confidently.</h2>
          <p>
            For the most accurate fit, measure your foot at the end of the day
            when your feet are at their largest. Wear the type of socks you
            would normally wear with your footwear.
          </p>
        </div>

        <div className="size-guide-section">
          <h2>How to measure your foot</h2>

          <ol className="size-guide-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Place your foot</h3>
                <p>
                  Stand on a sheet of paper with your heel lightly touching a
                  wall.
                </p>
              </div>
            </li>

            <li>
              <span>02</span>
              <div>
                <h3>Mark your longest point</h3>
                <p>
                  Mark the end of your longest toe on the paper.
                </p>
              </div>
            </li>

            <li>
              <span>03</span>
              <div>
                <h3>Measure the length</h3>
                <p>
                  Measure from the edge of the paper at your heel to the mark
                  you made for your longest toe.
                </p>
              </div>
            </li>

            <li>
              <span>04</span>
              <div>
                <h3>Compare your measurement</h3>
                <p>
                  Use your measurement with the table below to find the closest
                  Tricea size.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="size-guide-section">
          <div className="size-guide-table-header">
            <div>
              <p className="size-guide-label">TRICEA SIZING</p>
              <h2>Footwear size chart</h2>
            </div>
            <p>Measurements are approximate.</p>
          </div>

          <div className="size-guide-table-wrapper">
            <table className="size-guide-table">
              <thead>
                <tr>
                  <th>Tricea Size</th>
                  <th>EU Size</th>
                  <th>Foot Length</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>36</td>
                  <td>36</td>
                  <td>23.0 cm</td>
                </tr>
                <tr>
                  <td>37</td>
                  <td>37</td>
                  <td>23.7 cm</td>
                </tr>
                <tr>
                  <td>38</td>
                  <td>38</td>
                  <td>24.3 cm</td>
                </tr>
                <tr>
                  <td>39</td>
                  <td>39</td>
                  <td>25.0 cm</td>
                </tr>
                <tr>
                  <td>40</td>
                  <td>40</td>
                  <td>25.7 cm</td>
                </tr>
                <tr>
                  <td>41</td>
                  <td>41</td>
                  <td>26.3 cm</td>
                </tr>
                <tr>
                  <td>42</td>
                  <td>42</td>
                  <td>27.0 cm</td>
                </tr>
                <tr>
                  <td>43</td>
                  <td>43</td>
                  <td>27.7 cm</td>
                </tr>
                <tr>
                  <td>44</td>
                  <td>44</td>
                  <td>28.3 cm</td>
                </tr>
                <tr>
                  <td>45</td>
                  <td>45</td>
                  <td>29.0 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="size-guide-note">
          <h2>Between sizes?</h2>
          <p>
            If your measurement falls between two sizes, we recommend choosing
            the larger size for a more comfortable fit.
          </p>
        </div>

        <div className="size-guide-cta">
          <p>Still unsure about your size?</p>
          <Link href="/contact">Talk to us</Link>
        </div>
      </section>
    </main>
  );
}