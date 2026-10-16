import "./Chef.css";

export default function Chef() {
  return (
    <section className="chef-section">
      <div className="chef-photo">
        <img src="/images/chef.png" alt="Chef Arjun Mehta" />
      </div>
      <div className="chef-text">
        <span className="chef-role">Head chef &amp; Founder</span>
        <h2>Chef Arjun Mehta</h2>
        <p>
          With a passion for bold flavours and a deep respect for culinary
          traditions, Chef Arjun brings together time-honoured recipes, fresh
          ingredients, and modern techniques to create the signature Spice Haven
          experience.
        </p>
        <div className="chef-badges">
          <div className="chef-badge">
            <span>✦</span> Signature Technique
          </div>
          <div className="chef-badge">
            <span>✦</span> Custom Pairings
          </div>
        </div>
      </div>
    </section>
  );
}
